#!/bin/bash
set -e

DATE=$(date +"%Y-%m-%d")
HOUR=$(date +"%H")
MINUTE=$(date +"%M")
DAY=$(date +"%u")

TMP_DIR="/tmp/rameses-backup"
HOURLY_FILE="$TMP_DIR/$DATE-$HOUR-$MINUTE.gz"
WEEKLY_FILE="$TMP_DIR/$DATE.gz"

echo "Starting backup for $DATE-$HOUR-$MINUTE"
mkdir -p $TMP_DIR

echo "Running mongodump..."
mongodump \
  --uri="mongodb://localhost:27000" \
  --archive=$HOURLY_FILE \
  --gzip

echo "Uploading hourly backup..."
rclone copy $HOURLY_FILE b2:rameses/backups/$DATE/
echo "Hourly backup uploaded"

if [ "$DAY" -eq 7 ] && [ "$HOUR" -eq 03 ]; then
  cp $HOURLY_FILE $WEEKLY_FILE
  echo "Uploading weekly backup..."
  rclone copy $WEEKLY_FILE b2:rameses/snapshots/
  echo "Weekly backup uploaded"
fi

rm -rf $TMP_DIR
echo "Backup complete"