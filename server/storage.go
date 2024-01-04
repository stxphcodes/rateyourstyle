package main

import (
	"context"
	"io"
	"log"

	gcs "cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
)

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
