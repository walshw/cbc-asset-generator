app.get('/', (req, res) => {
    res.send(`
    <form action="/upload" enctype="multipart/form-data" method="POST">
      <input type="file" name="myFile" multiple/>
      <input type="submit" value="Upload your files"/>
    </form>`);
});