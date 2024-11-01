export function toggleNote(noteId) {
  const noteFull = document.querySelector(`#note-${noteId} .note-full`);
  if (noteFull.style.display === "none" || noteFull.style.display === "") {
    noteFull.style.display = "block";
  } else {
    noteFull.style.display = "none";
  }
}

 export async function deleteNote(noteId) {
  try {
    const response = await fetch(`/notes/${noteId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      location.reload();
    } else {
      console.error("Failed to delete note");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export const notePreviews = document.querySelectorAll(".note-preview");
notePreviews.forEach((element) => {
  element.addEventListener("click", (event) => {
    const noteId = element.getAttribute("data-note-id");
    toggleNote(noteId);
  });
});

export const deleteButtons = document.querySelectorAll(".delete-note");
deleteButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const noteId = button.closest("li").id.split("-")[1];
    deleteNote(noteId);
  });
});

