import {supabase,isConfigured} from "./supabase.js";
const $=s=>document.querySelector(s), esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let user=null,news=[],anns=[];
async function init(){
 if(!isConfigured){alert("Konfigurasi Supabase belum diisi.");location.href="login.html";return;}
 const {data:{session}}=await supabase.auth.getSession();if(!session){location.href="login.html";return;}
 user=session.user;$("#admin-email").textContent=user.email;
 const {data:profile,error}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(error||!profile||!["admin","petugas"].includes(profile.role)){alert("Akses ditolak.");await supabase.auth.signOut();location.href="login.html";return;}
 await refresh();
}
async function refresh(){
 const [n,a]=await Promise.all([supabase.from("news").select("*").order("created_at",{ascending:false}),supabase.from("announcements").select("*").order("created_at",{ascending:false})]);
 if(n.error) alert(n.error.message); if(a.error) alert(a.error.message);
 news=n.data||[];anns=a.data||[];
 $("#admin-news-count").textContent=news.length;$("#admin-ann-count").textContent=anns.filter(x=>x.is_active).length;
 $("#admin-news-table").innerHTML=news.length?news.map(x=>`<tr><td>${esc(x.title)}</td><td>${esc(x.category)}</td><td><span class="status ${x.is_published?"":"off"}">${x.is_published?"Terbit":"Draft"}</span></td><td>${new Date(x.created_at).toLocaleDateString("id-ID")}</td><td><button class="action" data-edit-news="${x.id}">Edit</button><button class="action delete" data-del-news="${x.id}">Hapus</button></td></tr>`).join(""):'<tr><td colspan="5">Belum ada berita.</td></tr>';
 $("#admin-ann-table").innerHTML=anns.length?anns.map(x=>`<tr><td>${esc(x.title)}</td><td>${x.event_date||"-"}</td><td><span class="status ${x.is_active?"":"off"}">${x.is_active?"Aktif":"Nonaktif"}</span></td><td><button class="action" data-edit-ann="${x.id}">Edit</button><button class="action delete" data-del-ann="${x.id}">Hapus</button></td></tr>`).join(""):'<tr><td colspan="4">Belum ada pengumuman.</td></tr>';
}
$("#news-form").addEventListener("submit",async e=>{
 e.preventDefault();const id=$("#news-id").value;
 const payload={title:$("#news-title").value.trim(),category:$("#news-category").value.trim(),image_url:$("#news-image").value.trim()||null,summary:$("#news-summary").value.trim(),content:$("#news-content").value.trim(),is_published:$("#news-published").checked,author_id:user.id};
 const result=id?await supabase.from("news").update(payload).eq("id",id):await supabase.from("news").insert(payload);
 $("#news-message").textContent=result.error?result.error.message:"Berita berhasil disimpan.";
 if(!result.error){resetNews();await refresh();}
});
function resetNews(){$("#news-form").reset();$("#news-id").value="";$("#news-form-title").textContent="Tambah Berita";$("#news-published").checked=true;}
$("#news-reset").addEventListener("click",resetNews);
$("#ann-form").addEventListener("submit",async e=>{
 e.preventDefault();const id=$("#ann-id").value;
 const payload={title:$("#ann-title").value.trim(),content:$("#ann-content").value.trim(),event_date:$("#ann-date").value||null,is_active:$("#ann-active").checked,author_id:user.id};
 const result=id?await supabase.from("announcements").update(payload).eq("id",id):await supabase.from("announcements").insert(payload);
 $("#ann-message").textContent=result.error?result.error.message:"Pengumuman berhasil disimpan.";
 if(!result.error){resetAnn();await refresh();}
});
function resetAnn(){$("#ann-form").reset();$("#ann-id").value="";$("#ann-form-title").textContent="Tambah Pengumuman";$("#ann-active").checked=true;}
$("#ann-reset").addEventListener("click",resetAnn);
document.addEventListener("click",async e=>{
 const t=e.target;
 if(t.dataset.editNews){const x=news.find(n=>n.id===t.dataset.editNews);if(!x)return;$("#news-id").value=x.id;$("#news-title").value=x.title;$("#news-category").value=x.category;$("#news-image").value=x.image_url||"";$("#news-summary").value=x.summary;$("#news-content").value=x.content;$("#news-published").checked=x.is_published;$("#news-form-title").textContent="Edit Berita";window.scrollTo({top:0,behavior:"smooth"});}
 if(t.dataset.delNews&&confirm("Hapus berita ini?")){const r=await supabase.from("news").delete().eq("id",t.dataset.delNews);if(r.error)alert(r.error.message);await refresh();}
 if(t.dataset.editAnn){const x=anns.find(a=>a.id===t.dataset.editAnn);if(!x)return;$("#ann-id").value=x.id;$("#ann-title").value=x.title;$("#ann-content").value=x.content;$("#ann-date").value=x.event_date||"";$("#ann-active").checked=x.is_active;$("#ann-form-title").textContent="Edit Pengumuman";window.scrollTo({top:0,behavior:"smooth"});}
 if(t.dataset.delAnn&&confirm("Hapus pengumuman ini?")){const r=await supabase.from("announcements").delete().eq("id",t.dataset.delAnn);if(r.error)alert(r.error.message);await refresh();}
});
$("#logout-btn").addEventListener("click",async()=>{await supabase.auth.signOut();location.href="login.html";});
init();
