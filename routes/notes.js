const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/notes");
const { body, validationResult } = require("express-validator");
// NOTE: get all the notes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    res.send(404);
  }
});

// NOTE: Tis route corresponds to adding a note
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid Title").isLength({ min: 3 }),
    body("description", "Desc must be at least 5 characters").isLength({
      min: 5,
    }),
  ],

  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // dude this is really important how it is forming must know this concept
      const note = new Notes({ title, description, tag, user: req.user.id });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Sever error occured");
    }
  }
);

// update node : login required
router.put("/updatenode/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }
    // find the node to be updated and update it
    let note = await Notes.findById(req.params.id);
    if (!note) res.status(404).send("Not found");
    if (note.user.toString() !== req.user.id) {
      res.status(401).send("Not Allowed");
    }
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Sever error occured");
  }
});

router.delete("/deletenode/:id", fetchuser, async (req, res) => {
  // const { title, description, tag } = req.body;

  // find the node to be updated and update it
  try {
    let note = await Notes.findById(req.params.id);
    if (!note) res.status(404).send("Not found");
    if (note.user.toString() !== req.user.id) {
      res.status(401).send("Not Allowed");
    }
    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Result: "Note has been deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Sever error occured");
  }
});

module.exports = router;
