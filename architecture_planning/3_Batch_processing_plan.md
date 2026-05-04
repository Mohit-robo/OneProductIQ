Frontend changes
- add queue display for multiple images pending processing done
- add progress bar X of N images
- show results per image
- allow pause resume
- add export batch results as CSV JSON

Backend changes
- implement sequential processing of uploaded images up to 100
- support pause resume of processing queue
- enable export of results as CSV JSON

Next step
- run integration test for batch processing
- verify queue order and export outputs