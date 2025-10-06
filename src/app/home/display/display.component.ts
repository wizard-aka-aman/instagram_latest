import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit, OnDestroy, AfterViewInit {
  storiesGroupedByUser: any[] = [];
  loggedInUserStory: any;
  loggedInUser: string = '';
  posts: any[] = [];
  TotalPost = 0;

  // Story
  currentUserStories: any[] = [];
  currentStoryIndex = 0;
  currentUser: any = null;
  showModal = false;
  storyInterval: any;
  isStoryAvailable = false;

  // Like/Comment/Save
  newComments: { [postId: number]: string } = {};
  setPostId = 0;

  // Search
  searchQuery = '';
  searchResults: any[] = [];
  AllFollowingResults: any[] = [];
  showDropdown = false;
  debounceTimer: any;

  // Pagination
  pageNumber = 1;
  pageSize = 5;
  loading = false;

  @ViewChildren('commentInput') commentInputs!: QueryList<ElementRef>;
  @ViewChildren('postCard') postCards!: QueryList<ElementRef>;
  observer!: IntersectionObserver;

  constructor(
    private serviceSrv: ServiceService,
    private toastr: ToastrService
  ) {
    this.loggedInUser = this.serviceSrv.getUserName();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.restoreScrollPosition();

    this.serviceSrv.HomePostRefresh$.subscribe((posts: any[]) => {
      this.posts = posts;
      // ✅ Reset pageNumber based on how many posts are already loaded
      this.pageNumber = Math.floor(this.posts.length / this.pageSize) + 1;

      // ✅ Re-attach scroll observer whenever posts are restored
      // setTimeout(() => this.setupInfiniteScroll(), 0);
    });
    this.serviceSrv.HomePostRefreshSubjectTotalNumber$.subscribe((total: number) => {
      this.TotalPost = total;
    });


    if (this.serviceSrv.HomePostRefreshSubject.value.length === 0) {
      this.getPosts();
    }
  }


  ngAfterViewInit() {
    this.setupInfiniteScroll();
  }

  ngOnDestroy(): void {
    localStorage.setItem('homeScroll', window.scrollY.toString());
  }

  // ================= INIT =================
  loadInitialData() {
    this.serviceSrv.GetFollowingRefreshFetched$.subscribe({
      next: (data: boolean) => {
        if (!data) {
          this.serviceSrv.GetFollowing(this.loggedInUser).subscribe({
            next: (data: any) => {
              this.serviceSrv.GetFollowingRefreshSubject.next(data);
              this.serviceSrv.GetFollowingRefreshSubjectFetched.next(true);
              (this.AllFollowingResults = data)
            },
            error: (err) => console.error(err)
          });
        } else {
          this.serviceSrv.GetFollowingRefresh$.subscribe({

            next: (data: any) => (this.AllFollowingResults = data),

          })
        }
      }
    })

    this.serviceSrv.GetLoggedInUserStoryRefreshFetched$.subscribe({
      next: (data: boolean) => {
        if (!data) {
          this.serviceSrv.GetLoggedInUserStory(this.loggedInUser).subscribe({
            next: (data: any) => {
              this.loggedInUserStory = data;
              this.serviceSrv.GetLoggedInUserStoryRefreshSubject.next(data);
              this.serviceSrv.GetLoggedInUserStoryRefreshSubjectFetched.next(true);
              this.isStoryAvailable = data.displayStories?.length > 0;
            },
            error: (err) => console.error(err)
          });
        } else {
          this.serviceSrv.GetLoggedInUserStoryRefresh$.subscribe({
            next: (data: any) => {
              this.loggedInUserStory = data;
              this.isStoryAvailable = data.displayStories?.length > 0;
            }
          })
        }
      }
    })

    this.serviceSrv.GetStoryByUsernameRefreshFetched$.subscribe({
      next: (data: boolean) => {
        if (!data) {
          this.serviceSrv.GetStoryByUsername(this.loggedInUser).subscribe({
            next: (data: any) => {
              console.log(data);
              this.serviceSrv.GetStoryByUsernameRefreshSubject.next(data);
              this.serviceSrv.GetStoryByUsernameRefreshSubjectFetched.next(true);
              (this.storiesGroupedByUser = data)
            },
            error: (err) => console.error(err)
          });
        } else {
          this.serviceSrv.GetStoryByUsernameRefresh$.subscribe({
            next: (data: any) => {
              (this.storiesGroupedByUser = data)
            }
          })
        }
      }
    })
  }

  restoreScrollPosition() {
    const saved = localStorage.getItem('homeScroll');
    if (saved) {
      setTimeout(() => window.scrollTo({ top: +saved, behavior: 'auto' }), 0);
    }
  }
  TimeSincePost(postDateTimeString: string): string {
    const postTime = new Date(postDateTimeString);
    const currentTime = new Date();
    const diffMs = currentTime.getTime() - postTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 24) {
      const diffMinutes = diffMs / (1000 * 60);
      if (diffMinutes < 1) { return 'Just now'; }
      else if (diffMinutes < 60) { return `${Math.floor(diffMinutes)} min ago` }
      else { return `${Math.floor(diffHours)} hr ago` }
    }
    else { return postTime.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); }
  }

  // ================= POSTS =================
  getPosts() {
    if (this.loading) return;
    this.loading = true;

    this.serviceSrv
      .DisplayPostHome(this.loggedInUser, this.pageNumber, this.pageSize)
      .subscribe({
        next: (data: any) => {
          console.log("API called...", data);
          this.TotalPost = data.total;

          data.item1.forEach((post: any) => {
            post.isLikedByMe = this.isLike(post.likes);
          });

          // Append properly
          const newPosts = this.pageNumber === 1
            ? data.item1
            : [...this.posts, ...data.item1];

          this.pageNumber++;

          // ✅ Update subject → component auto-updates via subscription
          this.serviceSrv.HomePostRefreshSubject.next(newPosts);
          this.serviceSrv.HomePostRefreshSubjectTotalNumber.next(data.total);

          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }

  setupInfiniteScroll() {
    // ✅ disconnect old observer to prevent duplicates
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number((entry.target as HTMLElement).getAttribute('data-index'));
          if (index >= this.posts.length - 2) {
            if (this.TotalPost != this.posts.length) {
              this.getPosts();
            }
          }
        }
      });
    }, { threshold: 0.5 });

    // ✅ Observe all postCards again
    this.postCards.forEach((card, i) => {
      card.nativeElement.dataset.index = i.toString();
      this.observer.observe(card.nativeElement);
    });

    // ✅ Re-apply when posts change
    this.postCards.changes.subscribe((cards: QueryList<ElementRef>) => {
      cards.forEach((card, i) => {
        card.nativeElement.dataset.index = i.toString();
        this.observer.observe(card.nativeElement);
      });
    });
  }

  // ================= LIKE =================
  Like(post: any) {
    if (post.isLikedByMe) return;

    // Optimistic UI
    post.isLikedByMe = true;
    post.likesCount++;

    this.serviceSrv
      .LikePost({
        postId: post.postId,
        likedBy: this.loggedInUser,
        postUsername: post.userName
      })
      .subscribe({
        error: () => {
          // Rollback on error
          post.isLikedByMe = false;
          post.likesCount--;
        }
      });
  }

  UnLike(post: any) {
    if (!post.isLikedByMe) return;

    // Optimistic UI
    post.isLikedByMe = false;
    post.likesCount--;

    this.serviceSrv
      .UnLikePost({
        postId: post.postId,
        likedBy: this.loggedInUser,
        postUsername: post.userName
      })
      .subscribe({
        error: () => {
          // Rollback on error
          post.isLikedByMe = true;
          post.likesCount++;
        }
      });
  }

  isLike(data: any): boolean {
    return data.some((like: any) => like.userName === this.loggedInUser);
  }

  // ================= COMMENT =================
  addComment(post: any) {
    const commentText = this.newComments[post.postId]?.trim();
    if (!commentText) return;

    // Optimistic UI
    const newComment = {
      userName: this.loggedInUser,
      commentText
    };
    post.comments.push(newComment);
    post.commentsCount++;
    this.newComments[post.postId] = '';

    this.serviceSrv
      .AddComment({
        CommentText: commentText,
        PostId: post.postId,
        UserName: this.loggedInUser
      })
      .subscribe({
        error: () => {
          // Rollback
          post.comments.pop();
          post.commentsCount--;
          this.newComments[post.postId] = commentText;
        }
      });
  }

  FocusComment(post: any) {
    setTimeout(() => {
      const index = this.posts.findIndex((p) => p.postId === post.postId);
      this.commentInputs.toArray()[index]?.nativeElement.focus();
    });
  }

  // ================= SAVE =================
  AddSaved(post: any) {
    if (post.isSaved) return;

    post.isSaved = true;

    this.serviceSrv
      .AddedToSaved({ postId: post.postId, UserName: this.loggedInUser })
      .subscribe({
        error: () => (post.isSaved = false)
      });
  }

  RemoveSaved(post: any) {
    if (!post.isSaved) return;

    post.isSaved = false;

    this.serviceSrv
      .RemovedFromSaved({ postId: post.postId, UserName: this.loggedInUser })
      .subscribe({
        error: () => (post.isSaved = true)
      });
  }

  // ================= STORY =================
  openStory(user: any) {
    this.currentUser = user;
    this.currentUserStories = user.displayStories;
    this.currentStoryIndex = 0;
    this.showModal = true;
    this.autoPlay();
  }

  closeStory() {
    this.showModal = false;
    clearInterval(this.storyInterval);
  }

  nextStory() {
    if (this.currentStoryIndex < this.currentUserStories.length - 1) {
      this.currentStoryIndex++;
    } else {
      this.closeStory();
    }
  }

  prevStory() {
    if (this.currentStoryIndex > 0) this.currentStoryIndex--;
  }

  autoPlay() {
    clearInterval(this.storyInterval);
    this.storyInterval = setInterval(() => this.nextStory(), 5000);
  }

  // ================= SEARCH =================
  performSearch(query: string) {
    if (!query.trim()) {
      this.searchResults = [];
      this.showDropdown = false;
      return;
    }

    this.serviceSrv.SearchUsers(query).subscribe({
      next: (res: any) => {
        this.searchResults = res;
        this.showDropdown = true;
      },
      error: () => {
        this.searchResults = [];
        this.showDropdown = false;
      }
    });
  }

  DeBounce() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(
      () => this.performSearch(this.searchQuery),
      300
    );
  }
  selectedLikes: any[] = [];
  openLikesModal(post: any) { this.selectedLikes = post.likes; }

  ClearSearchQuery() {
    this.searchQuery = '';
    this.searchResults = [];
    this.showDropdown = false;
  }

  // ================= SEND POST =================
  SendPost(user: string) {
    const sendform = {
      groupName: this.loggedInUser,
      user,
      postId: this.setPostId
    };

    this.serviceSrv.SendPost(sendform).subscribe({
      next: (data: any) => this.toastr.success(data.message),
      error: () => this.toastr.error('Error Occurred!!')
    });
  }

  AddPostId(post: any) {
    this.setPostId = post.postId;
    this.searchResults = this.AllFollowingResults;
  }
}
