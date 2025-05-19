// index.js
const express = require('express');
const app = express();
const PORT = 4000;

const getContainer = require('./cosmosClient'); 

app.use(express.json());
app.use(express.static('public')); // Para servir archivos estáticos (frontend)

// Mapa de contenedores y su clave de partición
const partitionKeys = {
  Clientes: 'ciudad',
  Productos: 'categoria',
  Pedidos: 'clienteid',
  Metodo_de_Pago: 'tipo',
  Inventario: 'productoid'
};

// GET para obtener todos los documentos de un contenedor
app.get('/api/:contenedor', async (req, res) => {
  const contenedor = req.params.contenedor;
  try {
    const container = getContainer(contenedor);
    const querySpec = { query: "SELECT * FROM c" };
    
    //Activar consulta entre particiones
    const { resources: items } = await container.items
      .query(querySpec, { enableCrossPartitionQuery: true })
      .fetchAll();

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error al obtener datos del contenedor ${contenedor}`);
  }
});

// GET para obtener un documento específico (requiere partitionKey en query)
app.get('/api/:contenedor/:id', async (req, res) => {
  const contenedor = req.params.contenedor;
  const id = req.params.id;
  const partitionKeyName = partitionKeys[contenedor];
  const partitionKeyValue = req.query.partitionKey;

  if (!partitionKeyValue) {
    return res.status(400).send(`Falta el valor de la clave de partición '${partitionKeyName}' en la query`);
  }

  try {
    const container = getContainer(contenedor);
    const { resource } = await container.item(id, partitionKeyValue).read();

    if (!resource) {
      return res.status(404).send('Documento no encontrado');
    }
    res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error al obtener el documento ${id} del contenedor ${contenedor}`);
  }
});

// POST para crear un nuevo documento (partitionKey se deduce del objeto)
app.post('/api/:contenedor', async (req, res) => {
  const contenedor = req.params.contenedor;
  const nuevoDocumento = req.body;
  try {
    const container = getContainer(contenedor);
    const { resource } = await container.items.create(nuevoDocumento);
    res.status(201).json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error al crear el documento en el contenedor ${contenedor}`);
  }
});

// PUT para actualizar un documento (requiere partitionKey en query)
app.put('/api/:contenedor/:id', async (req, res) => {
  const contenedor = req.params.contenedor;
  const id = req.params.id;
  const datosActualizados = req.body;
  const partitionKeyName = partitionKeys[contenedor];
  const partitionKeyValue = req.query.partitionKey;

  if (!partitionKeyValue) {
    return res.status(400).send(`Falta el valor de la clave de partición '${partitionKeyName}' en la query`);
  }

  try {
    const container = getContainer(contenedor);
    datosActualizados.id = id;
    const { resource } = await container.item(id, partitionKeyValue).replace(datosActualizados);
    res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error al actualizar el documento ${id} del contenedor ${contenedor}`);
  }
});

// DELETE para eliminar un documento (requiere partitionKey en query)
app.delete('/api/:contenedor/:id', async (req, res) => {
  const contenedor = req.params.contenedor;
  const id = req.params.id;
  const partitionKeyName = partitionKeys[contenedor];
  const partitionKeyValue = req.query.partitionKey;

  if (!partitionKeyValue) {
    return res.status(400).send(`Falta el valor de la clave de partición '${partitionKeyName}' en la query`);
  }

  try {
    const container = getContainer(contenedor);
    await container.item(id, partitionKeyValue).delete();
    res.send(`Documento ${id} eliminado del contenedor ${contenedor}`);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error al eliminar el documento ${id} del contenedor ${contenedor}`);
  }
});



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
