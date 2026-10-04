#!/usr/bin/env bash
# Builds the 3x2 footage composite for the Gate motif (BLUEPRINT.md §9.1): six
# moments of one source segment, one per cell, so the motif needs a single
# video decode instead of six.
#
# Usage: build-gate-grid.sh SRC START DUR CELL_W CELL_H CRF FPS OUT
#   SRC     source video (reel.mp4)
#   START   segment start in seconds (choose a hard cut in the source)
#   DUR     loop length in seconds (choose the next hard cut)
#   CELL_W/CELL_H  per-cell resolution; the composite is 3*CELL_W x 2*CELL_H
set -euo pipefail
SRC=$1; START=$2; DUR=$3; CW=$4; CH=$5; CRF=$6; FPS=$7; OUT=$8

TS=()
for i in 0 1 2 3 4 5; do TS+=("$(python3 -c "print(f'{$i*$DUR/6:.3f}')")"); done

FC="[0:v]split=6"
for i in 0 1 2 3 4 5; do FC+="[s$i]"; done
for i in 0 1 2 3 4 5; do
  FC+=";[s$i]trim=start=${TS[$i]},setpts=PTS-STARTPTS,scale=$CW:$CH,setsar=1[v$i]"
done
FC+=";[v0][v1][v2][v3][v4][v5]xstack=inputs=6:layout=0_0|${CW}_0|$((CW*2))_0|0_${CH}|${CW}_${CH}|$((CW*2))_${CH}[grid]"
FC+=";[grid]fps=$FPS[out]"

# The segment is cut first and looped, so each cell's trim offset can run past
# the segment's end and wrap cleanly at the hard cut the loop is built on.
ffmpeg -y -v error -ss "$START" -t "$DUR" -i "$SRC" -an -c:v libx264 -preset veryfast -crf 12 -pix_fmt yuv420p /tmp/gate-seg.mp4
ffmpeg -y -v error -stream_loop -1 -i /tmp/gate-seg.mp4 -t "$DUR" -filter_complex "$FC" -map "[out]" -an \
  -c:v libx264 -preset slow -crf "$CRF" -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT"
rm -f /tmp/gate-seg.mp4
echo "moments (s, within segment): ${TS[*]}"
ffprobe -v error -show_entries stream=width,height,r_frame_rate -show_entries format=duration,size -of default=nw=1 "$OUT"
