<template>
    <ul class="header_online_users">
        <li>
            <img :src="require('@/assets/img/header_user_img_1.jpg')" alt="">
        </li>
        <li>
            <img :src="require('@/assets/img/header_user_img_2.jpg')" alt="">
        </li>
        <li>
            <img :src="require('@/assets/img/header_user_img_3.jpg')" alt="">
        </li>
        <li class="plus_number">+4</li>
    </ul>
</template>

<script>
export default {
    name: 'HeaderUsers',

}
</script>