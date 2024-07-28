key="sk-proj-exAF36GEm9ZGYF5MWmDpT3BlbkFJt7cthPUnOgi6YG1jrajy"
prompt="can you describe each clothing item in this image and include the hex color code? use this json format without deviation: {'clothingItems': [{ 'description': 'description of item', 'colorHex': 'color hex code'}]}"
img="https://storage.googleapis.com/rateyourstyle/imgs/outfits/ATteL88XFAOM9nC7/HmY6k5xgXiiTedxs.jpeg"

generate_post_data()
{
  cat <<EOF
{
    "model": "gpt-4o",     
    "response_format": { "type": "json_object" },
    "n": 1,
"messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "$prompt"
          },
          {
            "type": "image_url",
            "image_url": {
              "url":"$img"                                                                                                                                            
            }
          }
        ]
      }
    ]
}
EOF
}

echo $(generate_post_data)


resp=$(curl "https://api.openai.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $key" \
  -d "$(generate_post_data)")


echo "this is resp"
echo $resp





