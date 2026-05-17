const axiosMock = {
  get: jest.fn(),
  post: jest.fn(),
  isAxiosError: jest.fn(() => false)
};

export default axiosMock;
