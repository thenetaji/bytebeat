# TuneVault :- Download any song, anywhere using power of AI!!

## Introduction 
 Just a simple music downloader but has some unique working mechanics which is AI based music scrapper.
 
## Contributing
 The project is split into frontend and backend so as they can be hosted seperately.The frontend is simple and can be set easily.
 
### Backend
  The backend uses `Apify` and `Google Gemini`.
  The working : It first sends the query to `apify scrape google result` actor which returns the result with pages then we fetch first and scrape all `audio files (.mp3,.ogg,.webm)` using cheerio and no links are found we procced on next page and after this it is sent to the `gemini` to find the best link using its LLM feature. The context behind using gemini is because the urls on the pages are so different on different pages and to predict that is hard and error prone....
  
  You can improve this by adding more advancing the gemini but its simple prototype and mostly it works 90% times.
  
## Future Roadmap

Currently, no further updates are planned. However, community contributions are welcome to keep the project alive.

## Contact

If you have questions or suggestions, feel free to email:
contact.dry528@passinbox.com