## How to add a new service

- In GCP console, go to "Networking Services". 
- To add a new service, you have to create a new networking endpoint group:
  - Go to the load balancer, hit Edit. 
  - Go to "Backend configuration". 
  - Select the dropdown "Backend services & backend buckets".
  - Hit "Create a backend service". 
  - Under "Backend type", select "Serverless network endpoint group". Then under instance group, you should see your cloudrun server
- Update routing rules if needed
- Once you deploy everything, it will take a few minutes for DNS to propogate. 