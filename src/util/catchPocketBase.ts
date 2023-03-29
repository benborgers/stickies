export default async function (callback: Function) {
  try {
    await callback();
  } catch (error: any) {
    alert(
      `${error.data.message}\n${Object.entries(error.data.data)
        .map(([key, obj]) => `${key}: ${obj.message}`)
        .join("\n")}`
    );
  }
}
