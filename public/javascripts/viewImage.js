let image1 = document.getElementById('imgView1')
let image2 = document.getElementById('imgView2')
let image3 = document.getElementById('imgView3')
let banner = document.getElementById('banner')

function viewImage1(event) {
    image1.src = URL.createObjectURL(event.target.files[0])
}
function viewImage2(event) {
    image2.src = URL.createObjectURL(event.target.files[0])
}
function viewImage3(event) {
    image3.src = URL.createObjectURL(event.target.files[0])
}
function viewBanner(event) {
    banner.src = URL.createObjectURL(event.target.files[0])
}