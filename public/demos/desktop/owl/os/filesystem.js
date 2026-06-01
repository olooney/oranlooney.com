// Copyright 2010 Oran Looney
(function() { 
	var root = owl.os.root;

	// set up the main guest home directory.  This is the on the main desktop.
	var guest = root.addDirectory('guest');
	guest.addNewFile('about.html').save('This project explores the possibility of using traditional OS concepts within a web application.  It provides a framework which includes users, files, applications, windows, and notifications.  Individual apps can then be plugged into that framework, accessing files, registering applications, opening windows, logging messages, and so forth.<br><br>It uses ExtJS and was inspired by their own Desktop example, which while pretty, didn\'t <b>do</b> anything.  It was an empty expanse of non-functioning buttons and stub data.  I thought it would be fun and educational to try and implement the logic to make a desktop actually work.  I strongly encourage you to read the code, since how I did it is even more interesting than what it does.  The implemention of drag-and-drop for possibly overlapping containers, for example, is required reading if you\'re an ExtJS developer, and the overall architecture of the code is fascinating if you\'ve ever faced the problem of organizing a large, JavaScript-heavy project.<br><br><em>My name is Oran Looney, and I\'m a professional web developer.  This page is part of my portfolio.  You\'re welcome to visit my site <a href="http://oranlooney.com">oranlooney.com</a> or contact me at <a href="mailto:olooney@gmail.com">olooney@gmail.com</a> with feedback.</em>');
	guest.addNewFile('files.txt').save('This is an example of a simple text file.  Compare it to rich_text.html.\n\nThe filesystem is closely based on Unix, with iNode representations, file and folder privileges, etc.  However, it much simpler in some ways.  Everything is readable by everyone, and there are no groups.  If you\'re familar with Unix, you can think of it as a filesystem with only one privilege bit.  Every file and directory is either rw-r-r- or rw-r-rw.  The low-level filesystem object model supports links (hard links, where multiple files share an iNode) but this is only used behind the scenes during file move operations and isn\'t directly exposed in the UI, more because of time constraints then because don\'t think it\'s useful.\n\nThis system is intentionally designed to support collabrative workflows.  Imagine a small team, say half a dozen people, all able to work on the same project, see each others contributions, and edit the shared public files, while also having their own home directory and files.');
	guest.addNewFile('rich_text.html').save('HTML file are <b>different</b> than text files.  Because of their <em>extensions</em>, they\'re editing by the HtmlEdit application, an WYSIWYG rich text editor.<br><br>If you rename a file and change it\'s extension from .html to .txt, then you can open it with the TextEdit application and see the HTML source.  You can also go the other way.<br><br>Every application can register as the handler for any number of file extensions.  When you Open that object, that application is started and passed the file.');
	guest.addDirectory('sample').addNewFile('sample.txt').save('sample text file');
	guest.addDirectory('sample2').addNewFile('sample2.txt').save('another sample text file');

	var file = guest.addNewFile('public_file.txt');
	file.makePublic();
	file.save('This is a public file in a personal directory. Anyone can edit the contents of the file, but only the owner of the directory (which is you, in this case) can rename, delete, or move it.  The act of making a file public cannot be reversed.  However, you could still copy the file, and then you would be the sole owner of the copy.');
	var pub = guest.addDirectory('public_dir');
	pub.makePublic();
	var file = pub.addNewFile('edit_me.txt');
	file.makePublic();
	file.giveTo('other');
	file.save('This file is owned by someone else, but is public and is in a public folder, so anyone (including you) can edit, rename, delete, or move it to another folder.');
	var file = pub.addNewFile('dont_edit_me.txt');
	file.save('This file is owned by someone else and is in a public folder, so anyone can rename, delete, or move it.  However, the file itself is not public, so only its owner can edit the contents.');
	file.giveTo('other');
	var op = guest.addDirectory('other_private');
	var file = op.addNewFile('about.txt');
	file.save('This file and directory are owned by another user and are not public.  You can open and read them, but don\'t have permission to edit this file (because the file is not public) or to rename or delete the file (because the directory it\'s in is not public.  However, because the directory itself is inside a directory you own, you can delete this whole folder if you like.\n\nThe "other" user has his own home directory. If you open the FileManager from the Start menu, it will open at the root directory and you\'ll be able to see it.');
	file.giveTo('other');
	op.giveTo('other');

	// also set up another user's home directory as an example.
	var other = root.addDirectory('other');
	var file = other.addNewFile('other_file.txt');
	file.save('This file is owned by the "other" user, and is in their home directory.');
	file.giveTo('other');
	var file = other.addNewFile('public.txt');
	file.save('This file is owned by the "other" user, is in their home directory, but is also public.  That means you can edit it but not rename or delete it.');
	file.makePublic();
	file.giveTo('other');
	other.giveTo('other');

	var file = root.addNewFile('about_home_directories.txt');
	file.save('Each user has their own Home directory with the same name as their user name.  You\'re currently logged in as "guest" and your desktop shows the contents of the "guest" folder.  There\'s also another home directory for the "other" user as an example.');
	file.giveTo('root');

	// lock down the root folder.
	root.giveTo('root');


}).defer(250);
