const API_URL = "http://localhost:3000";

export const getExercises = async () => {
  try {
    const response = await fetch(`${API_URL}/api/exercises`);
    if (!response.ok) throw new Error("Error al obtener ejercicios");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};