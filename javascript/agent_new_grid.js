
(
    
    function () {

    //display the generated button
    onUiLoaded(function n(){
     

        var button=gradioApp().querySelector("#txt2img_generate")
        button.style.display="none"
        var button=gradioApp().querySelector("#img2img_generate")
        button.style.display="none"

    //    隐藏 主栏目的tab页面。
       var elementsToHide = document.querySelectorAll('.tab-nav.scroll-hide.svelte-kqij2n' );
       // 遍历并隐藏这些元素
       for (var i = 0; i < elementsToHide.length; i++) {
           elementsToHide[i].style.display = 'none';
       }
       //默认页面切换到账号验证处，如果在首页账号验证成功，则通过js进行验证请求，如果请求正确，则正常显示。并将html中的用户信息进行修改

        var elementIDToHide = ["#quicksettings","#txt2img_extra_tabs","#txt2img_prompt_container","#txt2img_tools","#txt2img_styles_row","#txt2img_enqueue"]
    // 遍历列表并逐个隐藏元素
        for (var i = 0; i < elementIDToHide.length; i++) {
            var element = gradioApp().querySelector( elementIDToHide[i])

            if (element) {
                // 检查元素是否存在，以避免不存在的元素导致错误
                element.style.display = 'none'
            }
        }


        // 同步 txt2img 和 img 2 img中的内容获取控件元素中的文本框元素
        const txt2img_userName =gradioApp().querySelector('#txt2img_username').getElementsByTagName('input')[0];
        const img2img_userName =gradioApp().querySelector('#img2img_username input');
        const txtDropInput = gradioApp().querySelector('#txt2img_project').querySelector('input.svelte-1xsj8nn');        
        const proDropInput = gradioApp().querySelector('#img2img_project').querySelector('input.svelte-1xsj8nn');        
        
        //设置密码显示
        const txt2img_password =gradioApp().querySelector('#txt2img_password').getElementsByTagName('input')[0];
        txt2img_password.type="password";
        const img2img_password =gradioApp().querySelector('#img2img_password').getElementsByTagName('input')[0];
        img2img_password.type="password";

        //增加测试
        txt2img_userName.addEventListener('keyup', () => {
            img2img_userName.value = txt2img_userName.value
            proDropInput.value = txtDropInput.value

            var elementIDToHide = ["#quicksettings"]
            // 遍历列表并逐个隐藏元素
            // for (var i = 0; i < elementIDToHide.length; i++) {
            //     var element = gradioApp().querySelector( elementIDToHide[i])
    
            //     if (element) {
            //         // 检查元素是否存在，以避免不存在的元素导致错误
            //         element.removeAttribute("style")
            //     }
            // }
            // console.log(`txt_img_ user: 输入的值：${txt2img_userName.value}`);
            // console.log(`img_img_ user: 输入的值：${img2img_userName.value}`);
            // console.log(`proDropInput user: 输入的值：${proDropInput.value}`);
            // console.log(`txtDropInput user: 输入的值：${txtDropInput.value}`);




        });
        img2img_userName.addEventListener('keyup', () => {
            txt2img_userName.value = img2img_userName.value
            txtDropInput.value = proDropInput.value
            
        });
        txt2img_password.addEventListener('keyup', () => {
            img2img_password.value = txt2img_password.value
            proDropInput.value = txtDropInput.value
            
        });
        img2img_password.addEventListener('keyup', () => {
            txt2img_password.value = img2img_password.value
            txtDropInput.value = proDropInput.value
            
        });


    });

})();
