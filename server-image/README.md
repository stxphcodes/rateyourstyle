## Image server

This server handles the POST /api/image endpoint, which is called when users upload photos. This server requires `exiftool` to be installed in the container running it. We use `exiftool` to remove metadata from the photo.