const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Función para cifrar la contraseña
function hashPassword(password) {
    const hash = crypto.createHash('sha512');
    hash.update(password);
    return hash.digest('hex');
}

function verificarToken(req, res, next) {
    const token = req.headers.authorization; // Obtén el token del encabezado

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    next();
}


//conexion a la base de datos
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://cordova:cordova@testing.dianjyo.mongodb.net/?retryWrites=true&w=majority&appName=testing').then(() => {
    console.log('> Connected to MongoDB');
}).catch((err) => {
    console.log('Error: ', err.message);
});

const app = express();
app.use(express.json());
app.listen(3000, () => {
    console.log(`> Server Started at ${3000}`);
});


const Animals = mongoose.model('Animals', {
    name: String,
    type: String,
    age: Number
});

const Users = mongoose.model('Users', {
    name: String,
    email: String,
    password: String
});

app.post('/animals', async (req, res) => {
    const animal = new Animals(req.body);
    try {
        await animal.save();
        res.send(animal);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/animals', async (req, res) => {
    try {
        const animals = await Animals.find();
        res.send(animals);
    } catch (error) {
        res.status(500).send
    }
});

app.patch('/animals/:id', async (req, res) => {
    try {
        console.log(req.params.id)
        const _id = req.params.id;
        await Animals.findByIdAndUpdate(_id, req.body);
        res.send({ message: "Animal was updated" });
    } catch (error) {
        res.status(500
        ).send(error);
    }
});

app.delete('/animals/:id', async (req, res) => {
    try {
        const animal = await Animals.findByIdAndDelete(req.params.id);
        if (!animal) {
            res.status(404).send("No animal found");
        }
        res.send({ message: "Animal was deleted" });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/register', verificarToken,async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = hashPassword(req.body.password);

    const user = new Users({
        name: name,
        email: email,
        password: password
    });

    try {
        await user.save();
        res.send({ message: "User was registered" });
    } catch (error) {
        res.status(500
        ).send(error);
    }
});

app.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = hashPassword(req.body.password);

        const user = await Users.findOne({ email: email, password: password });
        if (!user) {
            return res.send({ message: "User not found" });
        }

        const payload = { name: user.name, email: user.email };
        const secretKey = 'prueba';
        const token = jwt.sign(payload, secretKey, { expiresIn: '1m' });
        console.log(token);

        return res.send({ message: "Welcome " + user.name });
    } catch (error) {
        return res.status(500
        ).send(error);
    }
});