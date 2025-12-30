type FakeApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const fakeApi = async <T>(
  response: FakeApiResponse<T>,
  delay = 800,
  shouldFail = false
): Promise<FakeApiResponse<T>> => {
  await new Promise((res) => setTimeout(res, delay));

  if (shouldFail) {
    return {
      success: false,
      error: response.error || "Something went wrong",
    };
  }

  return response;
};
