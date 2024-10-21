import { TestBed } from '@angular/core/testing';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngstack/translate';
let appService: AppService;

describe('coVisualization', () => {
  describe('Histogram datas', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      appService = TestBed.inject(AppService);
    });
  });
});
