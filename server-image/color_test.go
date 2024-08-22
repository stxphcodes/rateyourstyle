package main

import (
	"testing"
)

// This is really difficult to test, if you've got a good idea, pull request!

// Check if it returns all valid colors.
func TestColorValidity(t *testing.T) {
	var tests = []struct {
		hex         string
		expectation string
		notes       string
	}{
		{
			hex:         "#edae8a",
			expectation: "warm",
			notes:       "blake lively",
		}, {
			hex:         "#fcc7b5",
			expectation: "cool",
			notes:       "anne hathaway",
		},
		{
			hex:         "#f2e0d6",
			expectation: "cool",
			notes:       "nicole kidman",
		},
	}
	for _, tt := range tests {
		warmNeutralCool(tt.hex)
	}
}
