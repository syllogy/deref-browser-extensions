const randomSource =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const randomString = (length: number) => {
  let text = '';
  for (let i = 0; i < length; i++) {
    text += randomSource.charAt(
      Math.floor(Math.random() * randomSource.length),
    );
  }

  return text;
};
