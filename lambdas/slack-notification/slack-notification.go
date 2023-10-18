package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
)

type Event struct {
	Records []Record
}

type Record struct {
	Body string
}

type SQSEvent struct {
    Records []struct {
        Body string `json:"body"`
    } `json:"Records"`
}

func handler(ctx context.Context, sqsEvent SQSEvent) (string, error) {
	slackBotToken := os.Getenv("SLACK_BOT_TOKEN")
	slackChannelId := os.Getenv("SLACK_CHANNEL_ID")

	for _, record := range sqsEvent.Records {
		sendSlackNotification(slackBotToken, slackChannelId, record.Body)
	}

	return "Slack notifications sent.", nil
}

func sendSlackNotification(token, channel, messageText string) {
	const postMessageURL = "https://slack.com/api/chat.postMessage"

	payload := map[string]interface{}{
		"blocks": []map[string]interface{}{
			{
				"type": "section",
				"text": map[string]string{
					"type": "mrkdwn",
					"text": messageText,
				},
			},
		},
		"channel": channel,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		log.Fatalf("Error marshalling payload: %v", err)
	}

	req, err := http.NewRequest("POST", postMessageURL, bytes.NewBuffer(body))
	if err != nil {
		log.Fatalf("Error creating request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("Error sending message to Slack: %v", err)
		return
	}
	defer resp.Body.Close()

	var respBody map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&respBody); err != nil {
		log.Printf("Error decoding Slack response: %v", err)
		return
	}

	if ok, exists := respBody["ok"].(bool); exists && !ok {
		log.Printf("Failed to send Slack notification: %s", respBody["error"])
	}
}

func main() {
    lambda.Start(handler)
}