In order to fetch images directly from bucket without running into CORS issues, we have to set CORS config for buckets. We fetch images directly because of the eyedrop color feature.

To add CORS to bucket,  run 
```
gcloud storage buckets update gs://{BUCKET_NAME} --cors-file={CORS_JSON_FILE}
```