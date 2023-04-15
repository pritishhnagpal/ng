import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, filter } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'front-end-internship-assignment-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  bookSearch: FormControl;
  pageNumber: number;
  allBooks: Array<any>;
  noData: boolean;
  selectedOption: FormControl;
  isDataLoading: boolean;

  options: Array<string> = ['Author', 'Book'];

  constructor(private http: HttpClient) {
    this.bookSearch = new FormControl('');
    this.pageNumber = 0;
    this.allBooks = [];
    this.selectedOption = new FormControl(this.options[0]);
    this.noData = false;
    this.isDataLoading = false;
  }

  trendingSubjects: Array<any> = [
    { name: 'JavaScript' },
    { name: 'CSS' },
    { name: 'HTML' },
    { name: 'Harry Potter' },
    { name: 'Crypto' },
  ];

  tableHead: Array<string> = ['Title', 'Authors', 'Year of Publication'];

  fetchQueryResult(): void {
    if (!this.shouldFetchData()) return;
    this.isDataLoading = true;
    const offset = this.pageNumber * 10;
    const type =
      this.selectedOption.value === this.options[0] ? 'author' : 'title';
    this.http
      .get(
        `https://openlibrary.org/search.json?${type}=${this.bookSearch.value}&limit=10&offset=${offset}`
      )
      .subscribe((response) => {
        //@ts-ignore
        if (response.docs.length === 0) this.noData = true;
        else this.noData = false;

        //@ts-ignore
        this.allBooks = response.docs.reduce((acc: Array<any>, cur: any) => {
          const {
            title = '',
            author_name = [],
            first_publish_year = '',
            key,
          } = cur;
          const obj: any = {
            title,
            authors: author_name.length > 0 ? [{ name: author_name[0] }] : [],
            first_publish_year,
            key,
          };
          acc.push(obj);
          return acc;
        }, []);

        console.log('this', this.allBooks);

        this.isDataLoading = false;
      });
  }
  ngOnInit(): void {
    this.bookSearch.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value: string) => {
        this.fetchQueryResult();
      });

    this.selectedOption.valueChanges.subscribe((value: string) => {
      this.fetchQueryResult();
    });
  }

  onNext(): void {
    this.pageNumber += 1;
    this.fetchQueryResult();
  }
  onPrevious(): void {
    if (this.pageNumber > 0) {
      this.pageNumber -= 1;
      this.fetchQueryResult();
    }
  }

  isNextDisabled(): boolean {
    return this.bookSearch.value.trim().length === 0 || this.isDataLoading;
  }

  isPrevDisabled(): boolean {
    return this.pageNumber === 0;
  }

  isDataPresent(): boolean {
    return !this.isDataLoading && this.allBooks.length !== 0;
  }

  shouldFetchData(): boolean {
    return this.bookSearch.value.trim().length > 0;
  }

  isDataInLoadingState(): boolean {
    return this.isDataLoading;
  }
}
