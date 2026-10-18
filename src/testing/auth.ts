import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

/** Beantwoordt `GET /api/auth/session`: als beheerder (met favorieten) of als bezoeker (204, geen sessie). */
export async function answerSession(http: HttpTestingController, admin: boolean, favorites: string[] = []): Promise<void> {
  const session = http.expectOne('/api/auth/session');
  if (admin) {
    session.flush({ username: 'roy', roles: ['admin'], csrfToken: 'csrf-token-1' });
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
    http.expectOne('/api/recipes/favorites').flush(favorites);
  } else {
    session.flush(null, { status: 204, statusText: 'No Content' });
  }
}
