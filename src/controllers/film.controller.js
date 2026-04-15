const filmService = require('../services/film.service');

const getFilms = async (req, res, next) => {
  try {
    const result = await filmService.getFilms(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getFilmById = async (req, res, next) => {
  try {
    const film = await filmService.getFilmById(req.params.id);
    res.json({ success: true, data: film });
  } catch (err) { next(err); }
};

const createFilm = async (req, res, next) => {
  try {
    const film = await filmService.createFilm(req.body);
    res.status(201).json({ success: true, data: film });
  } catch (err) { next(err); }
};

const updateFilm = async (req, res, next) => {
  try {
    const film = await filmService.updateFilm(req.params.id, req.body);
    res.json({ success: true, data: film });
  } catch (err) { next(err); }
};

const deleteFilm = async (req, res, next) => {
  try {
    await filmService.deleteFilm(req.params.id);
    res.json({ success: true, message: 'Film deleted' });
  } catch (err) { next(err); }
};

const getGenres = async (req, res, next) => {
  try {
    const genres = await filmService.getGenres();
    res.json({ success: true, data: genres });
  } catch (err) { next(err); }
};

const getMoods = async (req, res, next) => {
  try {
    const moods = await filmService.getMoods();
    res.json({ success: true, data: moods });
  } catch (err) { next(err); }
};

module.exports = { getFilms, getFilmById, createFilm, updateFilm, deleteFilm, getGenres, getMoods };
