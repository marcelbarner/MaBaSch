import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { InventoryService } from './inventory.service';
import { InventoryItem, InventoryItemInput } from '../models/inventory-item.model';

describe('InventoryService', () => {
  let service: InventoryService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/items`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(InventoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getItems sends no query params when the query is empty', () => {
    service.getItems({}).subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush([]);
  });

  it('getItems includes all provided query params', () => {
    service
      .getItems({
        search: 'Monitor',
        category: 'Elektronik',
        sortBy: 'price',
        sortDescending: true,
      })
      .subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === baseUrl &&
        r.params.get('search') === 'Monitor' &&
        r.params.get('category') === 'Elektronik' &&
        r.params.get('sortBy') === 'price' &&
        r.params.get('sortDescending') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getCategories calls the categories endpoint', () => {
    service.getCategories().subscribe();

    const req = httpMock.expectOne(`${baseUrl}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush(['Elektronik']);
  });

  it('createItem posts to the base url', () => {
    const input: InventoryItemInput = {
      name: 'Test',
      category: 'Test',
      quantity: 1,
      minQuantity: 1,
      unit: 'Stk',
      price: 1,
      location: null,
      variants: null,
    };

    service.createItem(input).subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush({} as InventoryItem);
  });

  it('updateItem puts to the item-specific url', () => {
    const input: InventoryItemInput = {
      name: 'Test',
      category: 'Test',
      quantity: 1,
      minQuantity: 1,
      unit: 'Stk',
      price: 1,
      location: null,
      variants: null,
    };

    service.updateItem('abc-123', input).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/abc-123`);
    expect(req.request.method).toBe('PUT');
    req.flush({} as InventoryItem);
  });

  it('deleteItem deletes the item-specific url', () => {
    service.deleteItem('abc-123').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/abc-123`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
