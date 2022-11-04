const validator = require('validator');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const validateAndAutoError = (
  value,
  type,
  name,
  isRequired = true,
  isNullable = true
) => {
  if (isNullable && value === null) {
    return false;
  }

  if (
    type[0] === type[0].toUpperCase()
      ? !validator[`is${type}`]('' + value)
      : typeof value !== type
  ) {
    if (isRequired || value !== undefined) {
      const message = isRequired
        ? `${name} as ${type} is required`
        : `${name} must be a ${type}`;
      createError(message, 400);
    }
    return true;
  }

  return false;
};

const bulkValidate = (
  inputObj,
  varList,
  isAllRequired,
  externalValidates = []
) => {
  let pass;

  switch (isAllRequired) {
    case false:
      pass = varList.reduce((acc, el) => {
        if (
          !validateAndAutoError(
            inputObj[el.name],
            el.type,
            el.name,
            false,
            el.isNullable
          )
        ) {
          return { ...acc, [el.name]: inputObj[el.name] };
        }
        return acc;
      }, {});

      const allVarList = [...varList];
      let isExternalInvalid = false;

      externalValidates.forEach((el) => {
        allVarList.push({ name: el.name, type: el.type });
        isExternalInvalid = isExternalInvalid || el.isInvalid;
      });

      if (Object.keys(pass).length === 0 && isExternalInvalid) {
        const varNames = allVarList.reduce(
          (acc, el, idx) => `${acc}${idx ? ', ' : ''}${el.name}(${el.type})`,
          ''
        );
        const message = `at least one of [${varNames}] is required`;
        createError(message, 400);
      }

      return pass;

    case true:
      varList.forEach((el) => {
        validateAndAutoError(
          inputObj[el.name],
          el.type,
          el.name,
          true,
          el.isNullable
        );
      });

      // return inputObj;
      break;

    default:
      varList.forEach((el) => {
        validateAndAutoError(
          inputObj[el.name],
          el.type,
          el.name,
          el.isRequired,
          el.isNullable
        );
      });
      break;

    // varList.forEach((el) => {
    //   if (
    //     !validateAndAutoError(
    //       inputObj[el.name],
    //       el.type,
    //       el.name,
    //       el.isRequired,
    //       el.isNullable
    //     )
    //   ) {
    //     pass[el.name] = inputObj[el.name];
    //   }
    // });

    // return pass;
  }
};

module.exports = {
  validator,
  createError,
  validateAndAutoError,
  bulkValidate,
};
