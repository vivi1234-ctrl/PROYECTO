// Importa el cliente de CosmosDB desde el SDK de Azure
const { CosmosClient } = require("@azure/cosmos");

// URL del endpoint del servicio de Azure Cosmos DB
const endpoint = "https://tienda-online-tec.documents.azure.com:443/";

// Clave de acceso primaria al servicio 
const key = "vmybMyWJqZ9vICI97VNrld2ZAlA5icOVxniEkC1wfVesV8qeiPz5U94WOIcTp7H2ca8AJGuMKlNyACDbHdBaxA==";

// Nombre de la base de datos a la que se accederá
const databaseId = "tienda-online-tec";

// Crea una instancia del cliente de Cosmos DB usando las credenciales y el endpoint
const client = new CosmosClient({ endpoint, key });

// Obtiene una referencia al objeto de base de datos
const database = client.database(databaseId);

// Función para obtener una referencia a un contenedor específico dentro de la base de datos
function getContainer(containerId) {
  return database.container(containerId);
}

// Exporta la función para que pueda ser utilizada en otros módulos
module.exports = getContainer;
