import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('start leeg en bewaart een favoriet alleen in de browser', () => {
    const favorites = TestBed.inject(FavoritesService);
    expect(favorites.ids()).toEqual([]);
    expect(favorites.toggle('a')).toBe('added');
    expect(favorites.isFavorite('a')).toBe(true);
    expect(JSON.parse(localStorage.getItem('recipes.favorites') ?? '[]')).toEqual(['a']);
    expect(favorites.toggle('a')).toBe('removed');
    expect(favorites.ids()).toEqual([]);
  });

  it('leest lokale favorieten en negeert vervuilde opslag', () => {
    localStorage.setItem('recipes.favorites', JSON.stringify(['a', 3, 'b']));
    expect(TestBed.inject(FavoritesService).ids()).toEqual(['a', 'b']);
    for (const kapot of ['{kapot', '"geen lijst"']) {
      localStorage.setItem('recipes.favorites', kapot);
      TestBed.resetTestingModule();
      expect(TestBed.inject(FavoritesService).ids()).toEqual([]);
    }
  });
});
