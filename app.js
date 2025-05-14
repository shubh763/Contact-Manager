require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const { URLSearchParams } = require('url');

const app = express();
const port = process.env.PORT || 8080;

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'contact_manager'
};

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        mimetype && extname ? cb(null, true) : cb(new Error('Only image files are allowed!'));
    }
}).single('profile_image');

// Helper function to safely render views
function renderWithDefaults(res, view, data = {}) {
    const defaults = {
        error: null,
        success: null,
        name: '',
        email: '',
        phone: '',
        address: '',
        profile_image: null
    };
    res.render(view, { ...defaults, ...data });
}

// Routes
app.get('/', (req, res) => {
    renderWithDefaults(res, 'index');
});

app.get('/add-contact', (req, res) => {
    renderWithDefaults(res, 'add-contact', {
        error: req.query.error || null,
        name: req.query.name || '',
        email: req.query.email || '',
        phone: req.query.phone || '',
        address: req.query.address || ''
    });
});

app.post('/save-contact', (req, res) => {
    upload(req, res, async (err) => {
        const { name, email, phone, address } = req.body;
        
        if (err) {
            return res.redirect('/add-contact?' + new URLSearchParams({
                error: err.message,
                name: name || '',
                email: email || '',
                phone: phone || '',
                address: address || ''
            }).toString());
        }

        try {
            const connection = await mysql.createConnection(dbConfig);
            await connection.execute(
                'INSERT INTO contacts (name, email, phone, address, profile_image) VALUES (?, ?, ?, ?, ?)',
                [name, email, phone, address, req.file ? '/uploads/' + req.file.filename : null]
            );
            connection.end();

            // Redirect to view contacts with success message
            res.redirect('/view-contacts?success=Contact+added+successfully');
        } catch (error) {
            res.redirect('/add-contact?' + new URLSearchParams({
                error: 'Database error: ' + error.message,
                name: name || '',
                email: email || '',
                phone: phone || '',
                address: address || ''
            }).toString());
        }
    });
});

app.get('/view-contacts', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [contacts] = await connection.execute('SELECT * FROM contacts ORDER BY name');
        connection.end();

        renderWithDefaults(res, 'contact-list', { 
            contacts,
            success: req.query.success || null
        });
    } catch (error) {
        renderWithDefaults(res, 'index', { 
            error: 'Failed to load contacts: ' + error.message 
        });
    }
});

app.get('/edit-contact/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [contacts] = await connection.execute('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
        connection.end();

        if (contacts.length === 0) {
            return res.redirect('/view-contacts');
        }

        renderWithDefaults(res, 'edit-contact', { 
            contact: contacts[0]
        });
    } catch (error) {
        res.redirect('/view-contacts');
    }
});

app.post('/update-contact/:id', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.redirect(`/edit-contact/${req.params.id}?error=${encodeURIComponent(err.message)}`);
        }

        const { name, email, phone, address, existing_image } = req.body;
        let profile_image = existing_image || null;

        if (req.file) {
            profile_image = '/uploads/' + req.file.filename;
        }

        try {
            const connection = await mysql.createConnection(dbConfig);
            await connection.execute(
                'UPDATE contacts SET name = ?, email = ?, phone = ?, address = ?, profile_image = ? WHERE id = ?',
                [name, email, phone, address, profile_image, req.params.id]
            );
            connection.end();

            res.redirect('/view-contacts?success=Contact+updated+successfully');
        } catch (error) {
            res.redirect(`/edit-contact/${req.params.id}?error=${encodeURIComponent('Database error: ' + error.message)}`);
        }
    });
});

app.get('/delete-contact/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM contacts WHERE id = ?', [req.params.id]);
        connection.end();

        res.redirect('/view-contacts?success=Contact+deleted+successfully');
    } catch (error) {
        res.redirect('/view-contacts?error=' + encodeURIComponent('Failed to delete contact'));
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});