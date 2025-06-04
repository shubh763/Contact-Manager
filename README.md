# Contact Manager

Contact Manager is a web application built with Node.js, Express.js, EJS, and MySQL that allows users to manage their contacts efficiently. Users can add, view, edit, and delete contacts through a simple and intuitive web interface.

## Features

- Add new contacts with name, phone, email, and other details
- View a list of all contacts
- Edit contact information
- Delete contacts
- Search contacts by name or other fields
- Responsive web interface using EJS templates

## Technologies Used

- Node.js
- Express.js
- EJS
- MySQL
- (Add any other libraries you use, e.g., body-parser, dotenv, etc.)

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm (Node Package Manager)
- MySQL server

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shubh763/Contact-Manager.git
   cd Contact-Manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory.
   - Add your MySQL credentials and any other environment variables:
     ```
     DB_HOST=localhost
     DB_USER=your_mysql_username
     DB_PASSWORD=your_mysql_password
     DB_NAME=contact_manager
     PORT=3000
     ```

4. **Set up the MySQL database:**
   - Create a database named `contact_manager` (or your chosen DB name).
   - Run the SQL script (if provided) to create the required tables.  
     Example:
     ```sql
     CREATE TABLE contacts (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       email VARCHAR(255),
       phone VARCHAR(20),
       -- Add other fields as needed
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```

### Running the Application

```bash
nodemon app.js
```
- The app will be available at [http://localhost:8080](http://localhost:8080)

## Usage

- Visit the home page to see the list of contacts.
- Use the add, edit, and delete buttons to manage your contacts.
- Use the search feature to quickly find contacts.

## Folder Structure

- `routes/` - Express route definitions
- `views/` - EJS templates for web pages
- `public/` - Static assets (CSS, JS, images)
- `models/` - Database models and queries (if applicable)
- `app.js` or `index.js` - Main entry point

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss your ideas.

## License

[MIT](LICENSE)

---

> Inspired by the need for a simple, open-source contact management solution.
