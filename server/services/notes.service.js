// services/notes.service.js
import Note from "../models/Note.js"
import { _id } from "../db/db.js"

export const allNotes = () => Note.find()

export const getNotes = (userId) => Note.find({ userId })

export const recentNotes = (userId) => Note.find({ userId }).sort({ time: -1 }).limit(20)
export const oldestNotes = (userId) => Note.find({ userId }).sort({ time: 1 }).limit(20)


export const newNote = (noteData) => Note.insertMany([{ _id: _id(), ...noteData }]);
export const editNote = (id) => Note.findById(id)

export const updateNote = (note) =>
  Note.findOneAndUpdate({ _id: note._id }, { $set: { ...note } }, { new: true })

export const deleteNote = (id) => Note.findByIdAndDelete(id)

export const getNoteByTime = ({ userId, time }) =>
  Note.findOne({ userId, time })



export const updateNoteByTime = ({ userId, time, body }) =>
  Note.findOneAndUpdate({ userId, time }, { $set: { body } }, { new: true })

export const deleteNoteByTime = ({ userId, time }) =>
  Note.findOneAndDelete({ userId, time })

export const getNoteById = (id) => Note.findById(id)

export const getNotesByLocation = ({ userId, lat, lon }) =>
  Note.find({
    userId,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [Number(lon), Number(lat)],
        },
      },
    },
  })

export default {}
