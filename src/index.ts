import { DefaultAzureCredential } from "@azure/identity";
import * as arm from "@azure/arm-cosmosdb";
import * as mongo from "mongodb";
import dotenv from "dotenv"

(async () => {
  dotenv.config();
  const accountName = config("AZURE_DB_ACCOUNT_NAME");
  const dbName = config("AZURE_DB_NAME");
  const armClient = new arm.CosmosDBManagementClient(new DefaultAzureCredential(), config("AZURE_SUBSCRIPTION_ID"));
  const accounts: arm.DatabaseAccounts = armClient.databaseAccounts;
  const keys = await accounts.listKeys(config("AZURE_RG"), accountName);
  const primaryConnString = `mongodb://${accountName}:${keys.primaryMasterKey}@${accountName}.${config("COSMOS_DB_URL_SUFFIX")}:${config("COSMOS_DB_PORT")}/${dbName}?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@${accountName}@`;
  const dbClient = new mongo.MongoClient(primaryConnString);
  await dbClient.connect();
  const db = dbClient.db(dbName);
  await db.command({ ping: 1 });
  console.info(`Successfully connected to database: ${dbName}`);
  await dbClient.close();
})();

function config(key: string): string {
  return process.env[key];
}
