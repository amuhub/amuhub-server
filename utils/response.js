const get_response_dict = (status, message, data) => {
  return {
    status: status,
    message: message,
    data: data,
  };
};

module.exports = get_response_dict;
