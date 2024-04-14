package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"path/filepath"
	"time"

	gcs "cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
)

func timeNow() string {
	return time.Now().Format("2006-01-02") + "T" + time.Now().Format("15:04:05")
}

func joinPaths(dir string, id string) string {
	return filepath.Join(dir, id+".json")
}

func getFilepaths(ctx context.Context, bucket *gcs.BucketHandle, dir string) ([]string, error) {
	paths := []string{}
	objIter := bucket.Objects(ctx, &gcs.Query{
		Versions: false,
		Prefix:   dir,
	})

	for {
		attrs, err := objIter.Next()
		if err == iterator.Done {
			break
		}

		// skip directory
		if attrs.Name == dir+"/" {
			continue
		}

		if err != nil {
			log.Fatal(err)
		}

		paths = append(paths, attrs.Name)
	}

	return paths, nil
}

func readObjectBytes(ctx context.Context, bucket *gcs.BucketHandle, path string) ([]byte, error) {
	obj := bucket.Object(path)
	reader, err := obj.NewReader(ctx)
	if err != nil {
		return nil, err
	}
	defer reader.Close()

	return io.ReadAll(reader)
}

func writeObject(ctx context.Context, bucket *gcs.BucketHandle, path string, data any) error {
	obj := bucket.Object(path)
	writer := obj.NewWriter(ctx)
	defer writer.Close()

	return json.NewEncoder(writer).Encode(data)
}
