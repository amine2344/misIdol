const pool = require("../utils/db_config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const JWT_SECRET = process.env.JWT_SECRET;
const SECRET_KEY_MYSQL = process.env.SECRET_KEY_MYSQL;
const UKP_API_TOKEN = process.env.user_token;
const UKP_AUTH_TOKEN = process.env.bearer_token;

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

const handleError = (res, message, err) => {
  console.error(message, err);
  res.status(500).json({ message, err });
};

const getUserById = async (userId) => {
  try {
    const response = await axios.get(
      `https://dev.ukrposhta.ua/ecom/0.0.1/clients/${userId}?token=${UKP_API_TOKEN}`,
      {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${UKP_AUTH_TOKEN}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    throw new Error("Unable to fetch user data from external service");
  }
};


const signup = async (req, res) => {
  const {
    email,
    name,
    password,
    firstName,
    lastName,
    addressId,
    phoneNumber,middleName
  } = req.body;

  // Check for required fields
  if (!email || !name || !password || !firstName || !lastName || !phoneNumber || !addressId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Step 1: Create client using the API
    const apiUrl = "https://dev.ukrposhta.ua/ecom/0.0.1/clients?token=0d33990a-c2a6-48f7-8559-d07d6346122a";
    const apiHeaders = {
      Authorization: "Bearer 47a794af-abe6-3398-a50d-c481f6915b85",
      "Content-Type": "application/json",
    };

    const apiBody = {
      firstName,
      lastName,
      addressId,
      phoneNumber,middleName,
      type: "INDIVIDUAL",
    };

    const apiResponse = await axios.post(apiUrl, apiBody, { headers: apiHeaders });
    const clientData = apiResponse.data;

    // Insert client data into 'clients' table
    const insertClientSQL = `
      INSERT INTO clients (uuid, name, firstName, lastName, addressId, phoneNumber, type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const clientValues = [
      clientData.uuid,
      clientData.name,
      clientData.firstName,
      clientData.lastName,
      clientData.addressId,
      clientData.phoneNumber,
      clientData.type,
    ];

    await pool.query(insertClientSQL, clientValues);

    // Step 2: Insert user data into 'users' table
    const insertUserSQL = `
      INSERT INTO users (username, email, password, phoneNumber, uuid)
      VALUES (?, ?, ?, ?, ?)
    `;

    const userValues = [name, email, password, phoneNumber, clientData.uuid];

    await pool.query(insertUserSQL, userValues);

    // Success response
    return res.status(201).json({
      message: "User created successfully",
      clientUUID: clientData.uuid,
    });
  } catch (error) {
    console.error("Error during signup:", error.message);
    return res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};




/*{
1|app  |   name: 'BOUTRA MOHAMMED AMINE',
1|app  |   email: 'amineboutra96@gmail.com',
1|app  |   password: 'a:ine0032',
1|app  |   firstName: 'BOUTRA',
1|app  |   lastName: 'AMINE',
1|app  |   addressOption: 'new',
1|app  |   existingAddressId: '',
1|app  |   postcode: '12345',
1|app  |   country: 'UA',
1|app  |   region: 'France',
1|app  |   city: "Saint-Pierre d'amilly",
1|app  |   district: 'fr',
1|app  |   street: 'place des terres blanches',
1|app  |   houseNumber: '19',
1|app  |   apartmentNumber: '12',
1|app  |   phoneNumber: '0783187679'
1|app  | }*/
const createAddress = async (req, res) => {
  console.log(req.body);
  
  // Destructure only the necessary fields from req.body
  const {
    postcode,
    country,
    region,
    city,
    district,
    street,
    houseNumber,
    apartmentNumber,
    email,
    password,
    name,middleName,
    lastName,
    phoneNumber,
  } = req.body;

  // Validate the input
	//
	//
	console.log(middleName,  postcode , country , region , city , district , street , houseNumber , apartmentNumber , email , password , name , lastName , phoneNumber);

  try {
    // Make the external API call to Ukrposhta
    const ukrposhtaAddressData = {
      postcode,
      country,
      region,
      city,middleName,
      district,
      street,
      houseNumber,
      apartmentNumber,
    };
/*    const ukrposhtaAddressData = {
      postcode,
      country,
      region,
      city,
      district,
      street,
      houseNumber,
      apartmentNumber,
    };*/
    const ukrposhtaResponse = await axios.post(
      "https://dev.ukrposhta.ua/ecom/0.0.1/addresses",
      ukrposhtaAddressData,
      {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${UKP_AUTH_TOKEN}`, // Ensure the token is correctly set
          "Content-Type": "application/json",
        },
      }
    );

    // Extract necessary fields from the API response
    const apiAddress = ukrposhtaResponse.data;

    const sql = `INSERT INTO addresses (id, postcode, country, region, city, district, street, houseNumber, apartmentNumber, description)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      apiAddress.id, // Using the ID returned by the API
      apiAddress.postcode,
      country,
      apiAddress.region,
      apiAddress.city,
      apiAddress.district,
      apiAddress.street,
      apiAddress.houseNumber,
      apiAddress.apartmentNumber,
      apiAddress.description || null, // Handle optional fields
    ];

    // Insert the address into the database
    const result = await pool.query(sql, values);
    const addressId = apiAddress.id; // This is the ID of the newly created address

    // Call the signup function after creating the address
    await signup({
      body: {
        email,
        name: name,  // Assuming 'name' should be used as username
        password,
        firstName: name,  // Assuming 'name' should be used as firstName
        lastName,
        addressId,  // Pass the newly created address ID
        phoneNumber,middleName
      },
    }, res);

    // Make sure no further responses are sent after this point
    return res.status(201).json({
      message: "Address and user created successfully",
      databaseAddressId: addressId,
      ukrposhtaAddress: apiAddress,
    });
  } catch (err) {
    // Ensure no multiple responses are sent
    if (err.response && err.response.data && err.response.data.message) {
      // Specific error from Ukrposhta API
      return res.status(err.response.status).json({
        message: `Ukrposhta API Error: ${err.response.data.message}`,
      });
    } else if (err.code) {
      // Specific database error
      return res.status(500).json({
        message: `Database Error: ${err.code} - ${err.message}`,
      });
    } else {
      // General error fallback
      return res.status(500).json({
        message: "Unexpected Error",
        error: err.message,
      });
    }
  }
};



const fetchAddresses = async (req, res) => {
  const sql = `SELECT
                 id,
                 postcode,
                 country,
                 region,
                 city,
                 district,
                 street,
                 houseNumber AS houseNumber,
                 apartmentNumber AS apartmentNumber
               FROM addresses`;

  try {
    // Fetch all addresses from the database
    const results = await pool.query(sql);

    // Map the results to create an array of address objects

    // Directly return the fetched addresses
    res.status(200).json({
      message: "Addresses fetched successfully",
      addresses: results,
    });
  } catch (err) {
    console.error("Error fetching addresses:", err);
    return handleError(res, "Error fetching addresses", err);
  }
};



const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Find the user by email
    const [rows] = await  pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the password is correct
//    const isPasswordValid = await bcrypt.compare(password, user.password);
const isPasswordValid = (password == user.password ) ; 
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate a session token (e.g., JWT)
    const token = jwt.sign({ id: user.id, uuid: user.uuid }, "${JWT_SECRET}", { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
      uuid: user.uuid,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};
const logout = async (req, res) => {
  const sessionId = req.cookies.session_id;

  if (!sessionId) {
    return res.status(400).json({ message: "No active session." });
  }

  const sql = "DELETE FROM session WHERE id_session = ?";
  pool.query(sql, [sessionId], (err) => {
    if (err) {
      return handleError(res, "Error during logout", err);
    }

    res.clearCookie("session_id");
    res.status(200).json({ message: "Logout successful" });
  });
};

const getUserDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await getUserById(userId);
    res.status(200).json(user);
  } catch (err) {
    return handleError(res, "Error fetching user details", err);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getUserDetails,fetchAddresses, createAddress
};

