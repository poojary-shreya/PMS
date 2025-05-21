export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("personaldetails", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    employee_id: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    employmentStatus: {
      type: Sequelize.STRING,
      defaultValue: "Active",
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: Sequelize.STRING,
    dateOfBirth: Sequelize.DATEONLY,
    anniversary: Sequelize.DATEONLY,
    gender: Sequelize.STRING,
    panNumber: Sequelize.STRING,
    panCardFile: Sequelize.STRING,
    adharCardNumber: Sequelize.STRING,
    adharCardFile: Sequelize.STRING,
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    houseNumber: Sequelize.STRING,
    street: Sequelize.STRING,
    crossStreet: Sequelize.STRING,
    area: Sequelize.STRING,
    city: Sequelize.STRING,
    pinCode: Sequelize.STRING,
    degree: Sequelize.STRING,
    institution: Sequelize.STRING,
    year: Sequelize.INTEGER,
    qualificationFile: Sequelize.STRING,
    certificationName: Sequelize.STRING,
    issuedBy: Sequelize.STRING,
    certificationDate: Sequelize.DATEONLY,
    certificationFile: Sequelize.STRING,
    nomineeName: Sequelize.STRING,
    relationship: Sequelize.STRING,
    nomineeAge: Sequelize.INTEGER,
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("personaldetails");
}
