import {supabase,isConfigured} from "./supabase.js";
const form=document.querySelector("#login-form"),msg=document.querySelector("#login-message");
form.addEventListener("submit",async e=>{
 e.preventDefault();msg.textContent="";
 if(!isConfigured){msg.textContent="Konfigurasi Supabase belum diisi.";return;}
 const email=document.querySelector("#email").value.trim(),password=document.querySelector("#password").value;
 const {data,error}=await supabase.auth.signInWithPassword({email,password});
 if(error){msg.textContent=error.message;return;}
 const {data:profile,error:pe}=await supabase.from("profiles").select("role").eq("id",data.user.id).maybeSingle();
 if(pe||!profile||!["admin","petugas"].includes(profile.role)){await supabase.auth.signOut();msg.textContent="Akun belum memiliki hak akses admin/petugas.";return;}
 location.href="admin.html";
});
