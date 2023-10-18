package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/sqs"
)

type Request struct {
	Prefix   string            `json:"prefix"`
	Files    map[string][]byte `json:"files"` // map of filename to content
}

func sendMessageToSQS(message string) error {
	sess := session.Must(session.NewSession())
	svc := sqs.New(sess)

	queueURL := os.Getenv("SQS_QUEUE")
	if queueURL == "" {
		return fmt.Errorf("SQS_QUEUE environment variable not set")
	}

	_, err := svc.SendMessage(&sqs.SendMessageInput{
		QueueUrl:    aws.String(queueURL),
		MessageBody: aws.String(message),
	})

	return err
}

func handler(ctx context.Context, request Request) (string, error) {
	sess := session.Must(session.NewSession())
	svc := s3.New(sess)

	bucket := os.Getenv("S3_BUCKET")
	if bucket == "" {
		return "", fmt.Errorf("S3_BUCKET environment variable not set")
	}

	for filename, content := range request.Files {
		contentBytes, err := base64.StdEncoding.DecodeString(string(content))
		if err != nil {
			return "", fmt.Errorf("error decoding base64 content for %s: %v", filename, err)
		}

		key := filename
		if request.Prefix != "" {
			key = request.Prefix + "/" + filename
		}

		_, err = svc.PutObject(&s3.PutObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(key),
			Body:   bytes.NewReader(contentBytes),
		})

		if err != nil {
			// send failure message to SQS
			message := fmt.Sprintf("Failed to upload %s to S3: %v", filename, err)
			sendMessageToSQS(message)
			return "", err
		}
	}

	return "Upload successful!", nil
}

func main() {
    lambda.Start(handler)
}