# MongoDb Collection document Limiter

**MongoDb collection document limiter is a tool to limit you documents in a collection**
 
With this tool you can a specify a document limit to a collection and the server will delete documents that will over flow the limit 


### Overview
  - This project is created using **NodeJs**
  - This project users the offical **MongoDb driver** for **NodeJs** to communicate with the **MongoDb** database
 
### To run the project
  - Open the terminal
  
    > **Warning**  ***I have tested this code in Linux enviroment with docker***
    
  - ###Clone the project
    ```
    git clone https://github.com/0-kodiya-0/MongoCollectionLimiter.git && cd MongoCollectionLimiter
     ```
  - Run ``` npm install ``` 
    > If  ***error*** just run ``` npm install mongodb```
    
  - Then add a `.dockerignore` file
    ```
    cat
    ```
    
  - Then build the docker Image
    ```
    docker build ./ -t mongoCollectionLimiter
    ```
