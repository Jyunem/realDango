document.querySelectorAll('.help-list .help-item').forEach(item => {
    item.addEventListener('click', function() {
        const content = this.querySelector('.content');
        const currentlyActive = document.querySelector('.help-item.active');

        if (currentlyActive && currentlyActive !== this) {
            currentlyActive.classList.remove('active');
            currentlyActive.querySelector('.content').style.maxHeight = 0;
        }

        // 클릭한 항목의 .content 확장/축소
        if (this.classList.contains('active')) {
            this.classList.remove('active');
            content.style.maxHeight = '0px';
        } else {
            this.classList.add('active');
            content.style.maxHeight = content.scrollHeight + "px";

            setTimeout(() => {
                this.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300); // 지연 시간을 밀리초 단위로 설정
        }
    });
});



document.addEventListener('DOMContentLoaded', function () {
    // 모바일용 이미지 컨테이너와 비모바일 이미지 컨테이너를 선택
    var mobileImagesContainers = document.querySelectorAll('.mobileImages');
    var notMobileImagesContainers = document.querySelectorAll('.notMobile');

    // 화면 크기에 따라 이미지 표시 변경
    function updateImageDisplay() {
        if (window.innerWidth <= 767) {
            // 모바일 화면: 모바일용 이미지 컨테이너들을 보이게 하고, 비모바일 이미지 컨테이너들을 숨김
            mobileImagesContainers.forEach(function(container) {
                container.style.display = 'block';
            });
            notMobileImagesContainers.forEach(function(container) {
                container.style.display = 'none';
            });
        } else {
            // 비모바일 화면: 모바일용 이미지 컨테이너들을 숨기고, 비모바일 이미지 컨테이너들을 보이게 함
            mobileImagesContainers.forEach(function(container) {
                container.style.display = 'none';
            });
            notMobileImagesContainers.forEach(function(container) {
                container.style.display = 'block';
            });
        }
    }

    // 화면 크기 변경 시 이미지 표시 업데이트
    window.addEventListener('resize', updateImageDisplay);

    // 초기 로드 시 이미지 표시 상태 설정
    updateImageDisplay();
});
