# Walk To Jerusalem
## Logger for Group Event

### API Commands
Walk to Jerusalem uses AutomateNowAPI
**All Commands end in /APITOKEN**

## Submit Walk
Submit Walk
```
POST https://automatenow.duckdns.org/api/wtj/submitwalk
```
Payload
```json
{
  "distance":5,
  "init":"John D"
}
```
Expected Response
```json
{
	"message": "OK"
}
```


## Get Total Distance
Get total distance in raw number and percent
```
GET https://automatenow.duckdns.org/api/wtj/gettotaldistance

```
Example Response

```json
{
	"total": 1427,
	"percent": 33
}
```

## Get Data from specific checkpoint
Get Checkpoint Data
```
GET https://automatenow.duckdns.org/api/wtj/getcheckpoint/:name
```
Example Response
```json
{
	"data": {
		"_id": "...",
		"name": "Felixstowe",
		"distance": 75,
		"takeoff": 0,
		"info": [
			{
				"type": "facts",
				"owner": "Jack Cooper",
				"images": [...],
				"facts": [...]
			}
		],
		"__v": 0
	}
  ```
  
  ## Get List of all Checkpoints
  Get All Checkpoints
  ```
  GET https://automatenow.duckdns.org/api/wtj/allcheckpoints
  ```
  Example Response 
  ```json 
  {
	"checkpoints": [
		{
			"disabled": false,
			"name": "Felixstowe",
			"cache": {
				"filled": false
			}
		},
		...
	]
}
```
#  Get Current Checkpoint and Next Checkpoint
  ```
  GET https://automatenow.duckdns.org/api/wtj/checkpoint
  ```
  Example Response 

 ```json
 {
	"next": {
		"name": "Timisora",
		"distance": 1869,
		"percent": 11
	},
	"current": {
		"_id": "...",
		"name": "Vienna",
		"distance": 1373,
		"takeoff": 1190,
		"info": [...],
		"__v": 0
	},
	"at": 5
 }
 ```

## Get Distance Walked Today
```
GET https://automatenow.duckdns.org/api/wtj/getwalkedtoday
```
Example Resposne
```json
{
	"total": 40
}
```
