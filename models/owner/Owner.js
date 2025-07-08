const db =  require("../../config/db");


const createOwner = async(ownerData)=>{

  const query = `INSERT INTO Owners (
        owner_type, name, contact_person, email, phone_number,
        address, id_document_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`

  const values = [
    ownerData.owner_type,
    ownerData.name,
    ownerData.contact_person,
    ownerData.email,
    ownerData.phone_number,
    ownerData.address,
    ownerData.id_document_info,
    
  ]
  const result = await db.execute(query,values);
  return result;

}


const findByEmail = async (email) => {
  const sql = 'SELECT * FROM Owners WHERE email = ?';
  const [rows] = await db.execute(sql, [email]);
  console.log('Email search result:', rows);
  console.log('Rows length:', rows.length);

  if (rows.length > 0) {
    const user = rows[0];
    user.getSignedJwtToken = () => getSignedJwtToken(user.user_id);
    user.matchPassword = (enteredPassword) => matchPassword(enteredPassword, user.password);
    user.updateLastLogin = () => updateLastLogin(user.user_id);
    return user;
  }
  return null;
};


const findById = async(id) =>{
  const query = `SELECT * FROM Owners WHERE owner_id = ?`
  const result = await db.execute(query,[id]);
  return result[0]
}

const findAll = async() => {
  const  query = `SELECT * FROM Owners`
  const result = await db.execute(query);
  console.log(result,"===owners=====")
  return result
}


module.exports = {
  createOwner,
  findByEmail,
  findById,
  findAll
}