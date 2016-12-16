import { Component, Input, OnInit } from '@angular/core';

import { Link } from '../link';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {
  @Input()
  links: Link[] = [];

  pattern: String = `^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$`;

  placeholder: String = 'YouTube link here';

  constructor() { }

  ngOnInit(): void {
    this.links.push(new Link());
  }

  addLink(index: number): void {
    this.links.push(new Link());
  }

  removeLink(index: number): void {
    delete this.links[index];
    this.links.splice(index, 1);
  }

  trackBy(index: number): number {
    return index;
  }
}
