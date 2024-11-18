export const getNotes = (userId) => {
    console.log('getNotes');
    const notes = async () => {
        try {
            const response = await fetch(`http://localhost:5000/notes/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.log(error);
        }
    }    
}