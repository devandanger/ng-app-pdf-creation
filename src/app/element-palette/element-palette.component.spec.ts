import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementPaletteComponent } from './element-palette.component';

describe('ElementPaletteComponent', () => {
  let component: ElementPaletteComponent;
  let fixture: ComponentFixture<ElementPaletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElementPaletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElementPaletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
