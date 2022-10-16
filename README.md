# MongoDb Collection document Limiter

**MongoDb collection document limiter is a tool to limit you documents in a collection**
 
With this tool you can a specify a document limit to a collection and the server will delete documents that will over flow the limit 


### Overview
  - This project is created using **NodeJs**
  - This project users the offical **MongoDb driver** for **NodeJs** to communicate with the **MongoDb** database
  
### How does it run
   > The **NodeJs** process will watch a database in mongodb. You can add the database name in **DB_NAME** env variable.
    In that **database** you can have collections that you need to **limit** the document num and that you **don't want to limit** the document num. The
    collections that need to be **limit** is identify by the **COLL_IDENTIFY_VALUE** env variable. You can add any simbole to the **COLL_IDENTIFY_VALUE**
    env variable.
    
   > ***But you need to rename the collections that need to limited with COLL_IDENTIFY_VALUE at the first of the name.***
   
   ```
   ex :-  COLL_IDENTIFY_VALUE = * . And I have a collection called orders 
   ```
   > If I need to make **orders** collection a **limited** collection I have to rename my collection as ****orders***.     
     As you can see I have add the **COLL_IDENTIFY_VALUE** at the first of the **collection name**.
     So the NodeJs process will watch the collections with the **COLL_IDENTIFY_VALUE at the first**.
     
   > **But** still the collection will not be a limited collection. The NodeJs process will pick up the collection with **COLL_IDENTIFY_VALUE** but 
     it will ignore that collection if it doesn't have a document called **CONF** document
    
   > **What is a CONF document ??**
   
   - **CONF** document is a document that you **must** add to a collection if you name that collection with the **COLL_IDENTIFY_VALUE** at the first.
     **Because It is the document that you add the document limit num**. If **num of documents** in that collection get **bigger** than the number that
       is **specified in the CONF document** NodeJs process will **delete documents** in that collection **until** the num in
       the **CONF document match the num of documents in that collection**.
       
   - **CONF document should look like this**
   ```
        {
          "_id": "You can add any id But you need to add that id to CONF_ID env variable in Nodejs process also",
          "documentLimit": 15 // This is were you should specify the document limit
        }
   ```
   ```
   ex :-     {
               "_id": "MAX_COL_LIMIT",
               "collectionLimit": 15
             }
             
             CONF_ID = "MAX_COL_LIMIT"
             
             And I have to add the id "MAX_COL_LIMIT" to the CONF_ID env varible in the NodeJs process
   ```
   > **Warning**  ***The above document should be in every collection that want to limit the document num***

   > So the NodeJs process will look in the db that you specified in the **DB_NAME** and search for collections in that database
   > with the **COLL_IDENTIFY_VALUE** and check for
   > the **CONF document** with id that you
   > specified in **CONF_ID** and check **every time** if the num of documents in that collection = the num you specified in the **CONF
   >  document**
   
### To run the project
  - Open the terminal
  
    > **Warning**  ***I have tested this code in Linux enviroment with docker***
    
  - Clone the project
    ```
    git clone https://github.com/0-kodiya-0/MongoCollectionLimiter.git && cd MongoCollectionLimiter
     ```
  - Run ``` npm install ``` 
    > If  ***error*** just run ``` npm install mongodb```
    
    
  - Then build the docker Image
    ```
    docker build ./ -t mongoCollectionLimiter
    ```
  - Then run the `docker-compose.yml` with docker compose
     
     - In **docker compose file** there are **enviroment varibles** that you need to specify. 
     
       > **Warning** ***Without those enviroment varibles the server will not run***
     
     - There are **5 important enviroment** varibles
        ```
         MONGO_SERVER_DB_URI :- You need to add the mongodb connection uri here
        ```
        ```
        LOG_FILE_PATH :- you need to add path here to save your log file 
                         ex :- LOG_FILE_PATH: "/log"
        ```
        ```
        CONF_ID :- you need add a conf id here
                   ex :- CONF_ID: "MAX_COL_LIMIT"
        ```
        ```
        COLL_IDENTIFY_VALUE :- you need to add a col identify value here
                            ex :- COLL_IDENTIFY_VALUE: *
        ```
        ```
        DB_NAME :- The database name that you need to watch
                    ex :- DB_NAME: "customers"
        ```
